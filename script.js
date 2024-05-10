class Order {
    constructor(name) {
        this.name = name;
        this.foods = [];
    }


}



class OrderService {
    static url = 'https://66258084052332d553202e4f.mockapi.io/Promineo_Tech_API/foods';

    static getAllOrders() {
        return $.get(this.url);
    }

    static getOrder(id) {
        return $.get(this.url + `/${id}`);
    }

    static createOrder(order) {
        return $.post(this.url, order);
    }

    static updateOrder(order) {
        return $.ajax({
           url: this.url + `/${order.id}`,
           dataType: 'json',
           data: JSON.stringify(order),
           contentType: 'application/json',
           type: 'PUT' 
        });
    }

    static deleteOrder(id) {
        return $.ajax ({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static orders;

    static getAllOrders() {
        OrderService.getAllOrders().then(orders => this.render(orders));
    }
 
    //Will create the order by getting the customers name
    static createOrder(name) {
        OrderService.createOrder(new Order(name))
        .then(() => {
            return OrderService.getAllOrders();
         })
         .then((orders) => this.render(orders));
    }

    //Will delete the order if customer cancels
    static deleteOrder(id) {
        OrderService.deleteOrder(id)
        .then(() => {
            return OrderService.getAllOrders();
        })
        .then((orders) => this.render(orders));
    }

    //Will add food to the order based on customer typing the food input
    static addFood(orderId) {
        console.log("addFood ran. id: ", orderId);
        // Find the order corresponding to the orderId
        let order = this.orders.find(order => order.id === orderId);
        console.log(order)
        if (!order) {
            console.error("Order not found!");
            return;
        }
        let newFood = {
            foodName: $(`#${orderId}-food-name`).val(),
            quantity: $(`#${orderId}-food-quantity`).val()
        };
        console.log("newFood", newFood)
        
        order.foods.push(newFood);
        OrderService.updateOrder(order)
            .then(() => {
                return OrderService.getAllOrders();
            })
            .then((orders) => this.render(orders));
    }
    
        
    
    //Will delete the food if customer changes mind and does not want to buy an item.
    static deleteFood(orderId, foodName) {
        for (let order of this.orders) {
            if (order.id === orderId) {
                for (let i = 0; i < order.foods.length; i++) {
                    if (order.foods[i].foodName === foodName) {
                        order.foods.splice(i, 1); // Remove the food item from the array
                        OrderService.updateOrder(order)
                            .then(() => {
                                return OrderService.getAllOrders();
                            })
                            .then((orders) => this.render(orders));
                        return; // Exit the function after deletion
                    }
                }
            }
        }
        console.error("Food item not found in the order!");
    }
                
        
    static render(orders) {
        console.log("orders after render ", orders)
        this.orders = orders;
        $('#app').empty();
        for (let order of orders) {
            console.log("individual order: ", order)
            $('#app').prepend(
                `<div id="${order.id}" class="card">
                    <div class="card-header">
                        <h2>${order.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteOrder('${order.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${order.id}-food-name" class="form-control" placeholder="Place Order">
                                </div>
                                <div class="col-sm">
                                <input type="text" id="${order.id}-food-quantity" class="form-control" placeholder="How Many?">
                                </div>
                            </div>
                            <button id="${order.id}-new-food" onclick="DOMManager.addFood('${order.id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div> <br>`
            );
            for (let item of order.foods) {
                console.log("PICK ME", item)
                $(`#${order.id}`).find('.card-body').append(
                    `<p>
                    <span id="name-${item.foodName}"><strong>Name: </strong> ${item.foodName}</span>
                    <span id="area-${item.quantity}"><strong>Quantity: </strong> ${item.quantity}</span>
                    <button class="btn btn-danger" onclick="DOMManager.deleteFood('${order.id}', '${item.foodName}')">Delete Food</button>`
                
                );
             }
        }
    }
}

$('#create-new-order').click(() => {
    DOMManager.createOrder($('#new-order-name').val());
    $('#new-order-name').val('');
});

DOMManager.getAllOrders();