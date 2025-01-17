import db from '../models'
import bcrypt from 'bcryptjs' 
import { v4 } from 'uuid'
import chothuecanho from '../../data/chothuecanho.json'
import nhachothue from '../../data/nhachothue.json'
import matbangvanphong from '../../data/matbangvanphong.json'
import chothuetro from '../../data/chothuetro.json'
import generateCode from '../ultis/generateCode'
import { dataPrice, dataArea } from '../ultis/data'
import { getNumberFromString } from '../ultis/common'
require('dotenv').config()
const dataBody = [
    {
        body: chothuecanho.body,
        code: 'CTCH'
    },
    {
        body: nhachothue.body,
        code: 'NCT'
    },
    {
        body: matbangvanphong.body,
        code: 'MBVP'
    },
    {
        body: chothuetro.body,
        code: 'CTT'
    },
]


const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(12))

export const insertService = () => new Promise(async (resolve, reject) => {
    try {
        const provinceCodes = []
        const labelCodes = []
        dataBody.forEach(cate => {
            cate.body.forEach(async (item) =>{
                let postId = v4()
                let labelCode = generateCode(item?.header?.class).trim()
                labelCodes?.every(item => item?.code !== labelCode) && labelCodes.push({
                    code: labelCode,
                    value: item?.header?.class?.trim()
                })
                let provinceCode= generateCode(item?.header?.address?.split(',')?.slice(-1)[0]).trim()
                provinceCodes?.every(item => item?.code !== provinceCode) && provinceCodes.push({
                    code: provinceCode,
                    value: item?.header?.address?.split(',')?.slice(-1)[0].trim()
                })
                let attributesId = v4()
                let userId = v4()
                let imagesId= v4()
                let overviewId = v4()
                let currentArea = getNumberFromString(item?.header?.attributes?.acreage)
                let currentPrice = getNumberFromString(item?.header?.attributes?.price)
                await db.Post.create({
                    id: postId,
                    title: item?.header?.title,
                    star: item?.header?.start,
                    labelCode,
                    address: item?.header?.address,
                    attributesId,
                    categoryCode: cate.code,
                    description: JSON.stringify(item?.mainContent?.content),
                    userId,
                    overviewId,
                    imagesId,
                    areaCode: dataArea.find(area => area.max > currentArea && area.min <= currentArea) ?.code,
                    priceCode: dataPrice.find(area => area.max > currentPrice && area.min <= currentPrice) ?.code,
                    provinceCode
                })
                await db.Attribute.create({
                    id: attributesId,
                    price: item?.header?.attributes?.price,
                    acreage: item?.header?.attributes?.acreage,
                    published: item?.header?.attributes?.published,
                    hashtag: item?.header?.attributes?.hashtag,
                })
        
                await db.Image.create({
                    id: imagesId,
                    image: JSON.stringify(item?.images)
                })
                await db.Overview.create({
                    id: overviewId,
                    code: item?.overview?.content.find(i => i.name === "Mã tin:")?.content,
                    area: item?.overview?.content.find(i => i.name === "Khu vực")?.content,
                    type: item?.overview?.content.find(i => i.name === "Loại tin rao:")?.content,
                    target: item?.overview?.content.find(i => i.name === "Đối tượng thuê:")?.content,
                    bonus: item?.overview?.content.find(i => i.name === "Gói tin:")?.content,
                    created: item?.overview?.content.find(i => i.name === "Ngày đăng:")?.content,
                    expire: item?.overview?.content.find(i => i.name === "Ngày hết hạn:")?.content
                })
                await db.User.create({
                    id: userId,
                    name: item?.contact?.content.find(i => i.name === "Liên hệ:")?.content,
                    password: hashPassword('123456'),
                    phone: item?.contact?.content.find(i => i.name === "Điện thoại:")?.content,
                    zalo: item?.contact?.content.find(i => i.name === "Zalo")?.content,
                })

            })
        })
        provinceCodes?.forEach(async(item) => {
            await db.Province.create(item)
        })
        labelCodes?.forEach(async(item) => {
            await db.Label.create(item)
        })

        resolve('Done')

    } catch (error) {
        reject(error)
    }
})
export const createPriceAndAreas = () => new Promise((resolve, reject) => {
    try{
        dataPrice.forEach(async(item, index) => {
            await db.Price.create({
                code: item.code,
                value: item.value,
                order: index + 1
            })
        })
        dataArea.forEach(async(item, index) => {
            await db.Area.create({
                code: item.code,
                value: item.value,
                order: index + 1
            })
        })
        resolve('Ok')
    } catch(err) {
        reject(err)
    }
})