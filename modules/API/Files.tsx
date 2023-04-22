
export async function createImage(image: any) {
    const options = { quality: 0.7, base64: true };
    const source = image.uri;


    let base64Img = `data:image/jpg;base64,${image.base64}`
    let apiUrl = 'https://api.cloudinary.com/v1_1/dfgcpgiai/image/upload';

    let data = {
        "file": base64Img,
        "upload_preset": "ml_default",
    }


    const imageCreated = await fetch(apiUrl, {
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
    }).then(async r => {
        let data = await r.json()
        return data.secure_url
    }).catch(err => console.log(err))

    if (!imageCreated) {
        return ""
    }

    return imageCreated;

}