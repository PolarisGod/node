const platform=process.argv[2];
if (!platform) return console.error("platform is not be null!");
const fs=require('fs');
let pkg=require('./package');
try {
    /**
     *
     * @type {{dependencies}}
     */
    let appendPackage = require('./interface/' + platform + '/package');

    pkg["name"] = appendPackage["name"];
    pkg["description"] = appendPackage["description"];
    pkg["version"] = appendPackage["version"];

    for (let k in appendPackage.dependencies) {
        if (!pkg.dependencies[k]) {
            console.log('Merge dependencies:', appendPackage.dependencies[k]);
            pkg.dependencies[k] = appendPackage.dependencies[k];
        }
    }
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}catch (err){
    if (err.code!=='MODULE_NOT_FOUND') console.error(err);
}

