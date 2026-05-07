const {nanoid} = require('nanoid')
const URL = require('../models/url')
async function handleGenerateNewShortURL(req,res){
    const {url} = req.body || {};
    if(!url) return res.status(400).json({error:"url is required"})

    const shortID = nanoid(8)
    await URL.create({
        shortId: shortID,
        redirectURL: url,
        visitHistory: [],
        createdBy : req.user._id
    })

    const allurls = await URL.find({ createdBy: req.user._id });
    return res.render("home",{
        urls: allurls,
        id : shortID
    })
}

async function handleGetAnalytics(req,res){
    const shortId = res.params.shortId
    const result = await URL.findOne({shortId});
    return res.json({
        totalClicks : result.visitHistory.length,
        analytics : result.visitHistory
    })
}

module.exports = {handleGenerateNewShortURL,handleGetAnalytics}