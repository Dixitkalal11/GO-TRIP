import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';

// ✅ Use AngularFire imports (not raw firebase/app)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdsPGvy7HirlHkG7nbNd5O0LxTFXdLywA",
  authDomain: "gotrip-aa599.firebaseapp.com",
  databaseURL: "https://gotrip-aa599-default-rtdb.firebaseio.com",
  projectId: "gotrip-aa599",
  storageBucket: "gotrip-aa599.firebasestorage.app",
  messagingSenderId: "543094921909",
  appId: "1:543094921909:web:9b6801cfc03324f5507cfc",
  measurementId: "G-XFZ9Y933QR"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
}).catch(err => console.error(err));
