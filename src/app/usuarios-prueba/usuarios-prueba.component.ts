import { Component } from '@angular/core';  
import { FormsModule } from '@angular/forms';
import { UsuariosService } from './usuarios.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({  
    selector: 'app-usuarios-prueba',  
    standalone: true,
    imports: [FormsModule, RouterModule, CommonModule, HttpClientModule],
    templateUrl: './usuarios-prueba.component.html',  
    styleUrls: ['./usuarios-prueba.component.css'],  
})  
export class UsuariosPruebaComponent {  
    // Objeto literal para almacenar la información del usuario  
    usuario: { id?: number; nombre: string; apellido: string; edad: number; genero: string } = {  
        nombre: '',  
        apellido: '',  
        edad: 0,  
        genero: ''  
    };  
    
    // Lista para almacenar los usuarios obtenidos del backend  
    usuarios: Array<{ id: number; nombre: string; apellido: string; edad: number; genero: string }> = [];  

    constructor(private usuariosService: UsuariosService) {}  

    onSubmit() {  
        console.log('Formulario enviado!', this.usuario);  
        this.crearUsuario(); // O actualizarUsuario() dependiendo de tu lógica  
    }  

    // Método para crear un nuevo usuario  
    crearUsuario() {  
        this.usuariosService.createUsuario(this.usuario).subscribe((data: any) => {  
            console.log('Usuario creado:', data);  
            this.mostrarUsuarios(); // Actualiza la lista después de crear  
            this.limpiarFormulario();  
        });  
    }  

    // Método para actualizar un usuario existente  
    actualizarUsuario() {  
        if (this.usuario.id) {  
            this.usuariosService.updateUsuario(this.usuario.id, this.usuario).subscribe((data: any) => {  
                console.log('Usuario actualizado:', data);  
                this.mostrarUsuarios(); // Actualiza la lista después de actualizar  
                this.limpiarFormulario();  
            });  
        } else {  
            console.warn('No se puede actualizar, el ID del usuario no está definido.');  
        }  
    }  

    // Método para mostrar la lista de usuarios  
    mostrarUsuarios() {  
        this.usuariosService.getAllUsuarios().subscribe((data: Array<{ id: number; nombre: string; apellido: string; edad: number; genero: string }>) => {  
            this.usuarios = data;  
            console.log('Usuarios obtenidos:', this.usuarios);  
        });  
    }  

    // Método para eliminar un usuario  
    eliminarUsuario() {  
        if (this.usuario.id) {  
            this.usuariosService.deleteUsuario(this.usuario.id).subscribe(() => {  
                console.log('Usuario eliminado');  
                this.mostrarUsuarios(); // Actualiza la lista después de eliminar  
                this.limpiarFormulario();  
            });  
        } else {  
            console.warn('No se puede eliminar, el ID del usuario no está definido.');  
        }  
    }  

    // Método para limpiar el formulario  
    limpiarFormulario() {  
        this.usuario = { nombre: '', apellido: '', edad: 0, genero: '' }; // Resetea el formulario  
    }  
}