module.exports = [
    {
        files: ["src/**/*.js", "scripts/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                Phaser: "readonly",
                WebSocket: "readonly",
                module: "readonly",
                require: "readonly",
                __dirname: "readonly",
                process: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "semi": ["error", "always"],
            "quotes": ["error", "single", { "avoidEscape": true, "allowTemplateLiterals": true }]
        }
    }
];
