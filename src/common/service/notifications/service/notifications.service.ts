import { httpCientNotifications as httpClientTBC } from "./api"

export const sendQueueCount = async (isForce?:boolean) => {
    return await httpClientTBC.get('my-queue/count/'+isForce)
    .then(res => res.data)
    .catch(e => console.log(e))
}

export const testNotification = async (idCustomer:string) => {
    return await httpClientTBC.get('chat/send/notificacion/'+idCustomer)
    .then(res => res.data)
    .catch(e => console.log(e))
}

export const sendNotificationGallery = async (data:{customerId:string, type:string }) => { //gallery:any
    return await httpClientTBC.post(`user/${data.customerId}/gallery/notification`,data)
    .then(res => res.data)
    .catch(e => console.log(e))
}

/*import httpCientNotifications from "./api"
import { ConfigService } from "@nestjs/config"

const httpClientTBC = httpCientNotifications.getInstance();
export const sendQueueCount = (isForce?:boolean) => {
    return httpClientTBC.post('my-queue/count', isForce).then(res => res.data)
}*/