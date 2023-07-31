// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import fs from "fs";
import csvjson from "csvjson";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import { getEmbeddings, chatCompletion } from "./openai.js";
import {
  createStoreEntry,
  createProductEntry,
  getSimilarProducts,
} from "./db.js";

const DB_pass = "pplUXRfZFQ4jKE8W";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.post("/api/datasync", async (_req, res) => {
  const session = res.locals.shopify.session;
  const productData = await shopify.api.rest.Product.all({
    session: session,
  });
  const customerData=await shopify.api.rest.Customer.all({
    session: session,
  });

  const orderData=await shopify.api.rest.Order.all({
    session: session,
  });
  // var data=JSON.parse(JSON.stringify(productData.data));
  // var jsonContent=JSON.stringify(data);


  //Convert array to csv file
   const productCsvData=csvjson.toCSV(productData.data,{
    Headers:'key'
  });
  // const orderCsvData=csvjson.toCSV(orderData.data,{
  //   Headers:'key'
  // });
  // const customerCsvData=csvjson.toCSV(customerData.data,{
  //   Headers:'key'
  // });


  fs.writeFile('./productsDetails.csv',productCsvData,(err)=>{
    if(err){
      console.error(err);
      //throw new Error();
    }
    console.log("Converted Successfully!!!")
  })


  fs.writeFile('./ordersDetails.csv',orderCsvData,(err)=>{
    if(err){
      console.error(err);
      //throw new Error();
    }
    console.log("Converted Successfully!!!")
  })
  fs.writeFile('./customersDetails.csv',customerCsvData,(err)=>{
    if(err){
      console.error(err);
      //throw new Error();
    }
    console.log("Converted Successfully!!!")
  })
  const deets = await getShopDetails(session);
  const shopId = deets.id;
  const shopName=deets.name;
  const createdEntry = await createStoreEntry(shopId, shopName);
  const dd=productData.data[0];
  const cc=JSON.stringify(productData.data[0], null, 0);
  const filterData=productData.data.filter((val)=>!(val.images));
  console.log(JSON.stringify(productData.data));
  const embeddings = await getEmbeddings(cc);
  console.log(embeddings);
  for (const product of productData.data) {
    const embeddings = await getEmbeddings(JSON.stringify(product, null, 0));
    const createdEntry = await createProductEntry(shopId, product, embeddings);
  }

  res.status(200).send("data sync");M 
});

//chat
app.post("/api/chat", async (req, res) => {
  const message = req.body.message;

  const session = res.locals.shopify.session;
  const deets = await getShopDetails(session);
  const shopId = deets.id;
  const embeddings = await getEmbeddings(message);
  const similarProducts = await getSimilarProducts(embeddings, shopId);
  const prompt = `So the user asked this question "${message}" and we found these similar embeddings ${similarProducts}, Using this information format a good answer to give to the user`;
  const response = await chatCompletion(prompt);
  console.log(response);
  res.status(200).send({ message: response });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);

//helper functions

const getShopDetails = async (session) => {
  const res = await shopify.api.rest.Shop.all({
    session: session,
  });
  return res.data[0];
};
