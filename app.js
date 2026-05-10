const SUPABASE_URL =
"https://gwqnvhbzvzfzryxxdmui.supabase.co";
const SUPABASE_KEY =
"sb_publishable_okO0KEz-dX9jWd4f5ixtTQ_w0PZEhNw";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productsDiv = document.getElementById("products");

async function loadProducts(){

  const { data, error } = await supabaseClient
    .from("products")
    .select("*");

  if(error){
    console.log(error);
    return;
  }

  displayProducts(data);

  localStorage.setItem(
    "offline_products",
    JSON.stringify(data)
  );
}

function displayProducts(products){

  productsDiv.innerHTML = "";

  products.forEach(product => {

    productsDiv.innerHTML += `
      <div class="card">

        <img src="${product.image_url}" />

        <div class="card-body">

          <h3>${product.name}</h3>

          <p class="price">
            ₱${product.price}
          </p>

          <button class="add-btn"
            onclick='addToCart(${JSON.stringify(product)})'>
            🛒 Add to Cart
          </button>

        </div>

      </div>
    `;
  });

}

function addToCart(product){

  document.getElementById("addSound").play();

  const existing = cart.find(
    item => item.id === product.id
  );

  if(existing){
    existing.qty++;
  }else{
    cart.push({...product, qty:1});
  }

  saveCart();
  renderCart();
}

function saveCart(){
  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );
}

function renderCart(){

  const cartItems = document.getElementById("cart-items");

  cartItems.innerHTML = "";

  let total = 0;
  let count = 0;

  cart.forEach((item,index)=>{

    total += item.price * item.qty;
    count += item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">

        <h4>${item.name}</h4>

        <p>₱${item.price}</p>

        <div class="qty-controls">

          <button onclick="changeQty(${index},-1)">-</button>

          <span>${item.qty}</span>

          <button onclick="changeQty(${index},1)">+</button>

          <button onclick="removeItem(${index})">
            Remove
          </button>

        </div>

      </div>
    `;
  });

  document.getElementById("total").innerText = total;
  document.getElementById("cart-count").innerText = count;
}

function changeQty(index,change){

  cart[index].qty += change;

  if(cart[index].qty <= 0){
    cart.splice(index,1);
  }

  saveCart();
  renderCart();
}

function removeItem(index){

  cart.splice(index,1);

  saveCart();
  renderCart();
}

function toggleCart(){
  document.getElementById("cart")
    .classList.toggle("hidden");
}

function generateReceipt(){

  return "RCPT-" + Date.now();
}

async function checkout(){

  if(cart.length === 0){
    alert("Cart is empty");
    return;
  }

  const customerName = prompt("Customer Name");

  if(!customerName) return;

  const receipt = generateReceipt();

  let grandTotal = 0;

  for(const item of cart){

    const total =
      Number(item.price) * Number(item.qty);

    grandTotal += total;

    const { data, error } = await supabaseClient
      .from("sales")
      .insert([{

        receipt_id: receipt,
        products: item.name,
        qty: item.qty,
        price: Number(item.price),
        total: total,
        customers: customerName

      }]);

    if(error){

      console.error("SUPABASE ERROR:", error);

      alert(
        "Failed to save checkout.\nCheck console."
      );

      return;
    }
  }

  alert(
    `Checkout Success
Receipt: ${receipt}
Total: ₱${grandTotal}`
  );

  cart = [];

  saveCart();

  renderCart();
}
document.getElementById("search")
.addEventListener("input",(e)=>{

  const keyword = e.target.value.toLowerCase();

  const cards = document.querySelectorAll(".card");

  cards.forEach(card=>{

    const name = card.innerText.toLowerCase();

    card.style.display =
      name.includes(keyword)
      ? "block"
      : "none";
  });

});

loadProducts();
renderCart();
