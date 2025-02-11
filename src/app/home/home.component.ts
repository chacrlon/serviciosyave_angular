import { Component, OnInit, OnDestroy } from '@angular/core';  

@Component({  
    selector: 'home',  
    templateUrl: './home.component.html',  
    styleUrls: ['./home.component.css']  
})  
export class HomeComponent implements OnInit, OnDestroy {  
    // Lista de videos  
    videos: string[] = [  
        "assets/serv1.mp4",  
        "assets/serv2.mp4",  
        "assets/serv3.mp4",  
        "assets/serv4.mp4"  
    ];  
    currentVideoIndex: number = 0;  
    videoInterval: any; // Intervalo para el cambio automático de video  

    ngOnInit() {  
        this.videoInterval = setInterval(() => {  
            this.changeVideo(1); // Cambia al siguiente video cada 5 segundos  
        }, 9000); // Cambia cada 5 segundos  
    }  

    changeVideo(direction: number): void {  
        this.currentVideoIndex += direction;  

        // Asegúrate de que el índice esté dentro del rango de la lista de videos  
        if (this.currentVideoIndex < 0) {  
            this.currentVideoIndex = this.videos.length - 1; // Va al último video  
        } else if (this.currentVideoIndex >= this.videos.length) {  
            this.currentVideoIndex = 0; // Vuelve al primer video  
        }  
    }  

    ngOnDestroy() {  
        // Limpiar el intervalo cuando el componente se destruye  
        if (this.videoInterval) {  
            clearInterval(this.videoInterval); // Detener el intervalo  
        }  
    }  
}