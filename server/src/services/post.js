import db from '../models'

export const getPostsService = () => new Promise(async(resolve, reject) => {
    try {
        const response = await db.Post.findAndCountAll({
            raw: true,
            nest: true,
            include: [
                {model: db.Image, as: 'images', attributes: ['image']},
                {model: db.Attribute, as: 'attributes', attributes: ['price','acreage','published','hashtag']},
                {model: db.User, as: 'user', attributes: ['name','phone','zalo']}
            ],
            attributes: ['id','title','star','address','description']
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'Ok' : 'Getting posts is failed',
            response
        })
    } catch (error) {
        reject(error)
    }
})
export const getPostsLimitService = (page, query) => new Promise(async(resolve, reject) => {
    try {
        let offset = (!page || +page <= 1) ? 0 : (+page - 1) 
        const response = await db.Post.findAndCountAll({
            where: query,
            raw: true,
            nest: true,
            offset: offset * +process.env.LIMIT,
            limit: +process.env.LIMIT, // string thang integer
            include: [
                {model: db.Image, as: 'images', attributes: ['image']},
                {model: db.Attribute, as: 'attributes', attributes: ['price','acreage','published','hashtag']},
                {model: db.User, as: 'user', attributes: ['name','phone','zalo']}
            ],
            attributes: ['id','title','star','address','description']
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'Ok' : 'Getting posts is failed',
            response
        })
    } catch (error) {
        reject(error)
    }
})


export const getNewPostService = () => new Promise(async(resolve, reject) => {
    try {
        const response = await db.Post.findAll({
            raw: true,
            nest: true,
            offset: 0,
            order: [['createdAt','DESC']],
            limit: +process.env.LIMIT, // string thang integer
            include: [
                {model: db.Image, as: 'images', attributes: ['image']},
                {model: db.Attribute, as: 'attributes', attributes: ['price','acreage','published','hashtag']},
             ],
            attributes: ['id','title','star','createdAt']
        })
        resolve({
            err: response ? 0 : 1,
            msg: response ? 'Ok' : 'Getting posts is failed',
            response
        })
    } catch (error) {
        reject(error)
    }
})
