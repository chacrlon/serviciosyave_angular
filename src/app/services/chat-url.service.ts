import { Injectable } from '@angular/core';

@Injectable({ 
  providedIn: 'root' 
})
export class ChatUrlService {
  private readonly baseUrl = 'http://localhost:4200';

  // Construye URL para navegación directa (modal)
  buildNavigationUrl(
    userId: number,
    receiverId: number,
    vendorServiceId: number | null,
    ineedId: number | null,
    params: {
      userType: string,
      notificationId?: number,
      notificationId2?: number,
      paymentId?: number
    }
  ): string {
    const vsId = vendorServiceId ?? 0;
    const iId = ineedId ?? 0;
    
    const pathSegments = `chat/${userId}/${receiverId}/${vsId}/${iId}`;
    
    const queryParams = new URLSearchParams();
    queryParams.set('userType', params.userType);
    if (params.notificationId) queryParams.set('notificationId', params.notificationId.toString());
    if (params.notificationId2) queryParams.set('notificationId2', params.notificationId2.toString());
    if (params.paymentId) queryParams.set('paymentId', params.paymentId.toString());
    queryParams.set('userId2', receiverId.toString());

    return `/${pathSegments}?${queryParams.toString()}`;
  }

  // Construye URL absoluta para emails y iframes
  buildAbsoluteUrl(
    userId: number,
    receiverId: number,
    vendorServiceId: number | null,
    ineedId: number | null,
    params: {
      userType: string,
      notificationId?: number,
      notificationId2?: number,
      paymentId?: number
    },
    token?: string
  ): string {
    const relativeUrl = this.buildNavigationUrl(userId, receiverId, vendorServiceId, ineedId, params);
    const absoluteUrl = `${this.baseUrl}${relativeUrl}`;
    
    if (token) {
      return `${absoluteUrl}&token=${token}`;
    }
    
    return absoluteUrl;
  }
}