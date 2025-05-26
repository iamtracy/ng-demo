import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { ConfigService } from '../services/config.service'

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('http')) {
    // For relative URLs, add /api prefix
    const apiReq = req.clone({
      url: `/api${req.url}`
    })
    return next(apiReq)
  }
  
  return next(req)
} 