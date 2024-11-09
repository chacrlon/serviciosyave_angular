import { Component } from '@angular/core';  
import { RouterOutlet } from '@angular/router';  
import { UserAppComponent } from './components/user-app.component';  

@Component({  
  selector: 'app-root',  
  standalone: true,  
  imports: [RouterOutlet, UserAppComponent],  
  templateUrl: './app.component.html'  
})  
export class AppComponent {  
  title = 'user-app';  
}

/*import { Component } from '@angular/core';  
import { RouterOutlet } from '@angular/router';  
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  
import { UserAppComponent } from './components/user-app.component';  

@Component({  
  selector: 'app-root',  
  standalone: true,  
  imports: [RouterOutlet, UserAppComponent, BrowserAnimationsModule],  
  templateUrl: './app.component.html'  
})  
export class AppComponent {  
  title = 'user-app';  
}*/