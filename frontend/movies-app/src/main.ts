import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
//Proceso que inicia la aplicación
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
