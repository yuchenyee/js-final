const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");

let productData = []; //產品列表
let cartData = [];  //購物車列表

function init(){
    getProductList();
    getCartList();
}
init();

//取得產品API
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(response){
        productData = response.data.products;
        renderProductList();        
    })
}

//組產品清單
function renderProductList(){
    let str="";
        productData.forEach(function(item){
            combineProductHTMLItem(item);
            str += combineProductHTMLItem(item); 
        })
        productList.innerHTML = str;
}

//選單功能+篩選
productSelect.addEventListener('change',function(e){
    const category = e.target.value;
    if(category == "全部"){
        renderProductList();
        return;
    }
    let str = ""; 
    productData.forEach(function(item){
        if(item.category == category){
            str += combineProductHTMLItem(item);
        }
    })
    productList.innerHTML = str;
})

//重複的地方，將字串重組成function
function combineProductHTMLItem(item){ 
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
    </li>`
}

//加入購物車按鈕
productList.addEventListener("click",function(e){
    e.preventDefault(); 
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass!=="js-addCart"){    
        alert(`不是購物車按鈕`);
        return;
    }

    let productId = e.target.getAttribute("data-id");
    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id===productId){ 
            numCheck = item.quantity+=1;
        }
    })

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
          }
    })
    .then(function(response){
        alert(`加入購物車`);
        getCartList();
    })

})

//購物車POST
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){
        document.querySelector(".js-total").textContent = response.data.finalTotal;
        cartData = response.data.carts;  
        let str = "";
        cartData.forEach(function(item){
            str+=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.product.price*item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
        })         
        cartList.innerHTML = str;    
    })
}

//刪除邏輯
cartList.addEventListener('click',function(e){
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if(cartId==null){
        alert("你點到其他東西了")
        return;
    }
    console.log(cartId);

    //刪除單筆購物車
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(response){
        alert("刪除單筆購物車成功");
        getCartList();
    })
})

//刪除全部購物車
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(response){        
        alert("刪除全部購物車");
        getCartList();
    })
    .catch(function(response){
        alert("購物車已清空，請勿重覆點擊")
    })
})

//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    if(cartData.length==0){
        alert("請加入購物車");
        return;
    }

    //開始處理表單
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const customerTradeWay = document.querySelector("#tradeWay").value;
    console.log(customerName,customerPhone,customerEmail,customerAddress,customerTradeWay)
    //如果資料是空值
    if(customerName =="" || customerPhone =="" || customerEmail =="" || customerAddress =="" || customerTradeWay ==""){
        alert("請輸入訂單資訊");
        return;
    }
   //取得表單資料API
   axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
        "user": {
          "name": customerName,
          "tel": customerPhone,
          "email": customerEmail,
          "address": customerAddress,
          "payment": customerTradeWay
        }
      }
   })
   .then(function(response){
    alert("訂單建立成功")
    //清空資料
    document.querySelector("#customerName").value="";
    document.querySelector("#customerPhone").value="";
    document.querySelector("#customerEmail").value="";
    document.querySelector("#customerAddress").value="";
    document.querySelector("#tradeWay").value="ATM";
    getCartList();
   })
   

})


