module.exports = function(){
    
    
    function renderPage(res, page, settings){
        if(settings==undefined){
            res.render(page);
        } else {
            res.render(page, settings);
        }
    }
    
};