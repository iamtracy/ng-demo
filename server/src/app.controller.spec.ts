import { AppController } from './app.controller'

describe('AppController', () => {
  let appController: AppController

  it('should be defined', () => {
    appController = new AppController()
    expect(appController).toBeDefined()
  })
})
