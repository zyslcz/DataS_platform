class AgriLoan{
    interest:number
    rebate:number

    constructor(interest:number,rebate:number) {
        this.interest = interest
        this.rebate = rebate
    }
}
var obj = new AgriLoan(10,1)
console.log("利润为 : "+obj.interest+"，抽成为 : "+obj.rebate )

var x:number = 1;