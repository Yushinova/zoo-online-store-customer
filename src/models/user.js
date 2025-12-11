export class UserRequest{
    constructor(){
        this.name = '';
        this.phone = '';
        this.email = '';
        this.password = '';
    }
}

 export class UserLogin{
    constructor(){
        this.phone = '';
        this.password = '';
    }
 }

 export class UserResponse{
    constructor(){
        this.id = 0;
        this.name = '';
        this.phone = '';
        this.discont = 0;
        this.email = '';
        this.totalOrders = 0;
        this.uuid = '';
    }
 }