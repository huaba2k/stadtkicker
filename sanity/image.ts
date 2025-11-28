import createImageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const imageBuilder = createImageUrlBuilder(client)

// Diese Funktion nutzen wir gleich, um Bilder anzuzeigen
export const urlFor = (source: any) => {
  return imageBuilder.image(source)
}