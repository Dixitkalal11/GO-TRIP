import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "./components/navbar/navbar";
import { ToastContainerComponent } from "./components/toast/toast";
import { ChatbotComponent } from "./components/chatbot/chatbot";
import { ToastService } from "./services/toast.service";
import { filter, Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastContainerComponent, ChatbotComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'go-trip-frontend';
  showChatbot: boolean = true;
  private routerSubscription?: Subscription;

  constructor(
    private toast: ToastService,
    private router: Router
  ) {
    const originalAlert = window.alert.bind(window);
    window.alert = (message?: any) => {
      try {
        toast.info(String(message ?? ''));
      } catch {
        originalAlert(message);
      }
    };
    (window as any).appToast = {
      success: (msg: string) => toast.success(msg),
      error: (msg: string) => toast.error(msg),
      info: (msg: string) => toast.info(msg),
      warning: (msg: string) => toast.warning(msg)
    };
  }

  ngOnInit() {
    // Check initial route
    this.updateChatbotVisibility(this.router.url);

    // Subscribe to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateChatbotVisibility(event.url);
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  updateChatbotVisibility(url: string) {
    // Hide chatbot on login and register pages
    this.showChatbot = !url.includes('/login') && !url.includes('/register');
  }
}
