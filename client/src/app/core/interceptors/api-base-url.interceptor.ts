import { HttpInterceptorFn } from '@angular/common/http'

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('http')) {
    const apiReq = req.clone({
      url: `/api${req.url}`
    })
    return next(apiReq)
  }
  
  return next(req)
} 