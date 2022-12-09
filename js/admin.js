const orderList = document.querySelector(".js-orderList")
let orderData = [];

function init() {
    getOrderList(); 
}
init();

function renderC3(){
    console.log(orderData);
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category]==undefined){
                total[productItem.category]=productItem.price*productItem.quantity;
            }else{
                total[productItem.category]+=productItem.price*productItem.quantity;
            }
        })
    })
    console.log(total);

    let categoryAry = Object.keys(total);
    console.log(categoryAry);
    let newData = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);

    let chart = c3.generate({
        bindto: '#chart', 
        data: {
            type: "pie",
            columns: newData,
        },
    });
}

//取得訂單API
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            orderData = response.data.orders;            
            let str = "";
            orderData.forEach(function (item) {
                //組時間字串
                const timeStamp = new Date(item.createdAt*1000);
                const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`
                console.log(orderTime);
                //組產品字串
                let productStr = "";
                item.products.forEach(function(productItem) {
                    productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
                })
                //判斷訂單處理狀態
                let orderStatus="";
                if(item.paid==true){
                    orderStatus="已處理"
                }else{
                    orderStatus="未處理"
                }
                //組訂單字串
                str += `<tr>
                            <td>${item.id}</td>
                            <td>
                                <p>${item.user.name}</p>
                                <p>${item.user.tel}</p>
                            </td>
                            <td>${item.user.assress}</td>
                            <td>${item.user.email}</td>
                            <td>
                                <p>${productStr}</p>
                            </td>
                            <td>${orderTime}</td>
                            <td class="js-orderStatus">
                                <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
                            </td>
                            <td>
                            <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                            </td>
                        </tr>`
            })
            orderList.innerHTML = str;
            renderC3();
        })
}

//處理訂單狀態
orderList.addEventListener("click",function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    console.log(targetClass);
    let id = e.target.getAttribute("data-id");

    if(targetClass=="delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id);
        return;
    }
    if(targetClass=="orderStatus"){
        let status = e.target.getAttribute("data-status");
        changeOrderStatus(status,id);
        return;
    }
})


//改變訂單狀態:已處理/未處理
function changeOrderStatus(status,id){
    console.log(status,id);
    let newStatus;
    if(status==true){
        newStatus=false;
    }else{
        newStatus=true;
    }

    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
            "id": id,
            "paid": newStatus
          }
    }, {
        headers: {
            'Authorization': token,
        }
    })
    .then(function(response){
        alert("修改訂單狀態成功");
        getOrderList();
    })
}

//刪除訂單狀態
function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function(response){
            alert("刪除該筆訂單成功");
            getOrderList();
        })
}


//清除全部訂單API
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function(response){
            alert("刪除全部訂單成功")
            getOrderList();
        })
})
