import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "Enter Supabase URL";
const supabaseKey =
  "Enter Supabase API Key";
const supabase = createClient(supabaseUrl, supabaseKey);

async function createStoreEntry(id, storeName) {
  console.log("Creating store entry");
  console.log(id);
  const { data, error } = await supabase
    .from("stores")
    .insert([{ id: id ,shop_name:storeName}], { returning: "minimal" });
  if (error) {
    console.log(error);
  }
  return data;
}

async function createProductEntry(storeId, productJson, productEmbedding) {
  console.log("Creating product entry");

  const { data, error } = await supabase
    .from("products")
    .insert([
      { product: productJson, store_id: storeId, embedding: productEmbedding },
    ]);
    //.select();
  if (error) {
    console.log(error);
  }
  return data;
}

async function getSimilarProducts(query_embeddings, storeId) {
  const { data: products } = await supabase.rpc("match_products", {
    query_embedding: query_embeddings, // Pass the embedding you want to compare
    match_threshold: 0.78, // Choose an appropriate threshold for your data
    match_count: 1, // Choose the number of matches
  });
  console.log("Getting similar products");
  return JSON.stringify(products, null, 2);
}

export { createStoreEntry, createProductEntry, getSimilarProducts };
