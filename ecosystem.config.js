module.exports = {
    apps : [{
        name   : "dirtytaks_core",
        script : "./dist/main.js",
        env_production: {
            NODE_ENV: "production"
        }
    }]
}