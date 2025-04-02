import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import certs from '../cert.json'
var admin = require("firebase-admin");



// Initialize Firebase Admin
const apps = getApps()
const app = !apps.length
  ? initializeApp({
      credential: admin.credential.cert(certs)
    })
  : apps[0]

export const auth = getAuth(app)
