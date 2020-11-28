// --------------------- // بسم الله الرحمن الرحيم // --------------------- //
console.clear();
const {exec} = require('child_process')
  ,   app    = require('express')()

const data = {
    web:{
        dir:        '/root/uFlo/static'
    },
    app:{
        pm2name:    'index',
        dir:        '/root/uFlo',
    }
}

app.all('/:item/:mode?',(req,res)=>{

    let {item,mode} = req.params
    if (!mode) mode = 'soft';

    if (mode == 'soft') {
        exec(`git --git-dir='${data[item].dir}/.git' --work-tree=${data[item].dir} pull` , (err,stdout,stderr) => {

            if (err)    {console.log(err)}
            if (stderr) {console.log(stderr)}

            stderr ? res.send(stderr) : res.send(stdout)
            
        });
        if (data[item].pm2name){
            exec(`pm2 restart ${data[item].pm2name}`,(err,stdout,stderr) => {
                if (err)    {console.log(err)}
                if (stderr) {console.log(stderr)}
            })
        }
    }

    if (mode == 'hard') {

        exec(`git --git-dir='${data[item].dir}/.git' --work-tree=${data[item].dir} fetch --all && git --git-dir='${data[item].dir}/.git' --work-tree=${data[item].dir} reset --hard origin/master` , (err,stdout,stderr) => {
            
            if (err)    {console.log(err)}
            if (stderr) {console.log(stderr)}
            
            stderr ? res.send(stderr) : res.send(stdout)

        });

        if (data[item].pm2name) {
            exec(`pm2 restart ${data[item].pm2name}`,(err,stdout,stderr) => {
                if (err)    {console.log(err)}
                if (stderr) {console.log(stderr)}
            })
        }
    }

});


const port = 7770
app.listen(port, () => console.log(`update service is running on ${port}`));