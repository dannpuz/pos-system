const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadAdminProducts(){

  const { data } = await supabaseClient
    .from("products")
    .select("*");

  const div =
    document.getElementById("admin-products");

  div.innerHTML = "";

  data.forEach(product=>{

    div.innerHTML += `
      <div class="card">

        <img src="${product.image_url}">

        <div class="card-body">

          <h3>${product.name}</h3>

          <p>₱${product.price}</p>

          <button onclick="deleteProduct(${product.id})">
            Delete
          </button>

        </div>

      </div>
    `;
  });

}

async function addProduct(){

  const name =
    document.getElementById("name").value;

  const price =
    document.getElementById("price").value;

  const image =
    document.getElementById("image").value;

  await supabaseClient
    .from("products")
    .insert([{
      name,
      price,
      image_url:image
    }]);

  loadAdminProducts();
}

async function deleteProduct(id){

  await supabaseClient
    .from("products")
    .delete()
    .eq("id",id);

  loadAdminProducts();
}

loadAdminProducts();