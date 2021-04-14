const Order = require("./Order");

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    MENU:   Symbol("menu"),
});

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sMenu = ""
    }
    
    handleInput(sInput){
        var menu = {"borewors": 8.00,"steak": 15.00, "ribs": 9.00, "chicken": 12.00, "no":0.00};
        let aReturn = []; 

        switch(this.stateCur){
            case OrderState.WELCOMING:
                this.stateCur = OrderState.MENU;
                aReturn.push("Welcome to The Braii..");
                aReturn.push(`We are a pop-up restaurant and currently only offer 4 items on our menu! You can place an order through this SMS portal or you can visit our App to place an order the link is posted below.`);
                aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                aReturn.push("Our Menu is as follows: Borewors, T-Bone Steak, Sticky ribs, Peri-Peri Chicken");
                aReturn.push("When ordering please enter BOREWORS or STEAK or RIBS or CHICKEN.");
                break;
            case OrderState.MENU:
              if(sInput.toLowerCase() == "borewors" ||
              sInput.toLowerCase() == "steak" ||
              sInput.toLowerCase() == "ribs" ||
              sInput.toLowerCase() == "chicken" ||
              sInput.toLowerCase() == "no"){
                 this.stateCur = OrderState.PAYMENT;
                 this.sMenu = sInput; 
              }else{
                aReturn.push("Please enter one of the following BOREWORS or STEAK or RIBS or CHICKEN or say NO.")
              }
              
              var total;
              total= menu[this.sMenu];
              this.nOrder = total;

              aReturn.push("Thank-you for your order of");
              aReturn.push(`${this.sMenu}`);
              aReturn.push("Your Subtotal for your order is",total);
              aReturn.push(`Please pay for your order here`);
              aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
              let d = new Date();
              d.setMinutes(d.getMinutes() + 20);
              aReturn.push(`Your order will be delivered at ${d.toTimeString()}`);
             break;

             case OrderState.PAYMENT:
              this.stateCur = OrderState.PAYMENT;
              console.log(sInput);
              console.log(sInput.purchase_units[0]);
              this.isDone(true);
            break;
        }
        return aReturn;
    }

    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}