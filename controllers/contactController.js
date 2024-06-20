const processContacts = (req,res)=>{
    try{
        let response = {
            contact : {
    
            }
        }
        res.status(200).json(response)
    }
    catch(error){
        res.status(400).json({err : error});
    }
}

module.exports = {
    processContacts
};