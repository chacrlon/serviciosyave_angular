// src/app/models/user.ts  

export class User {  
    id: number;  
    name: string;  
    lastname: string;  
    email: string;  
    username: string;  
    password: string;  
    phone: string;    // Agrega esta propiedad  
    cedula: string;   // Agrega esta propiedad  
    birthdate: string; // Agrega esta propiedad  

    constructor() {  
        this.id = 0;  
        this.name = '';  
        this.lastname = '';  
        this.email = '';  
        this.username = '';  
        this.password = '';  
        this.phone = '';    // Inicializa el campo  
        this.cedula = '';   // Inicializa el campo  
        this.birthdate = ''; // Inicializa el campo  
    }  
}