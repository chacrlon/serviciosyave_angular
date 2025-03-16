import { Component, OnInit } from '@angular/core';    
import { Notification } from '../models/Notification';  
import { NotificationsseService } from '../notification-modal/notificationsse.service';   
import { BehaviorSubject } from 'rxjs';  
import { CommonModule } from '@angular/common';  
import { AuthService } from '../services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({  
  selector: 'app-all-notifications',  
  standalone: true,
  templateUrl: './all-notifications.component.html',  
  styleUrls: ['./all-notifications.component.css'],  
  imports: [CommonModule, MatDividerModule, MatMenuModule ]
})
export class AllNotificationsComponent implements OnInit {

  private readonly baseUrl = 'http://localhost:4200/chat/invite?';
  
  public notifications$: BehaviorSubject<any> = new BehaviorSubject([]);
  public previewNotification: string = 'initial';
  public chatUrl: SafeResourceUrl | undefined = undefined;
  public urlChat: string = "";
  public dataPreview: string | undefined;

  constructor(
    private authService: AuthService,
    private notificationsseService: NotificationsseService,
    private sanitizer: DomSanitizer,
  ) {}  

  ngOnInit(): void {
    this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlChat);

    this.getNotifications();
  }

  private getNotifications(): void {
    this.notificationsseService.getUserNotifications(this.authService.userId).subscribe({
      next: (response: Array<any>) => { response.length > 0 ? this.notifications$.next([...response.reverse()]) : this.notifications$.next([])},
      error: (err) => {}
    })
  }

  public action(notification: Notification): void {
    switch (this.getTypeNotification(notification.message)) {
      case "chat":
        this.previewNotification="chat"
        this.urlChat = `${this.baseUrl}userId=${this.authService.userId}&receiverId=${notification.userId2}&token=${this.authService.token}`;
        this.chatUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlChat);
        break;
      case "information":
        this.previewNotification="information";
        this.dataPreview = notification.message;
        break;
      default:
        this.previewNotification="initial";
        break;
    }
  }

  private getTypeNotification(message: string): string {
    if(message.includes("disputa")) { return "information"; }
    if(message.includes("Has comprado el servicio")) { return "chat"; }
    if(message.includes("ha comprado tu servicio")) { return "chat"; }
    return "initial";
  }

  public extractingUrl(message: string): string {
    const pattern = /http:\/\/localhost:4200\/claims\/\d+$/;
    const result = message.match(pattern);
    if (result) {
      return result[0];
    } else {
      return "";
    }
  }

  public cleanMessage(message:string, phrase: string) {
    const expresionRegular = new RegExp("\\b" + phrase + "\\b", "gi");
    return message.replace(expresionRegular, "");
  }

  public getDate(fecha: Date = new Date()): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = fecha.toLocaleString('es-ES', { month: 'short' }).toLowerCase();
  
    return `${dia}${mes}`;
  }
}