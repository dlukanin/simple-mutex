var allTestFiles = []
var TEST = 'test_';

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
    if (file.indexOf(TEST) !== -1) {
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
        allTestFiles.push(normalizedTestModule)
    }
})

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base',
    paths: {
        'q': './node_modules/q/q',
        'bluebird': './node_modules/bluebird/js/browser/bluebird',
        'chai': './node_modules/chai/chai',
    },


    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});
