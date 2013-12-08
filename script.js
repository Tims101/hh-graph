    var lazyProperty = function(target, propertyName, callback){
        var result, done;
        Object.defineProperty(target, propertyName, {
            get: function(){
                if(!done){
                    done = true;
                    result = callback.call(target);
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
    };

    var Graph = function(obj){
        return function(args){          
            var r = {};

            var resolve = function(property){
                var dep = obj.dependency[property];
                var solvedArgs = {};

                for (var i in dep){
                    if (!dep.hasOwnProperty(i)) continue;
                    var val = args[dep[i]] || r[dep[i]];
                    solvedArgs[dep[i]] = val; 

                    if (val === undefined){
                        console.log("Cannot resolve dependency \"" + dep[i] + "\". Check the required parameters and no circular dependencies.");
                        return undefined;
                    }
                }   
                
                console.log("call " + property);                
                return obj[property](solvedArgs);                   
            };

            for (var i in obj){             
                if (!obj.hasOwnProperty(i)) continue;
                if (i === "dependency") continue;               
                (function(){
                    var property = i;
                    r[property] = lazyProperty(r, property, function(){
                        try {
                            return resolve(property);   
                        } catch (e){
                            console.log("Excepton while resolving \"" + property + "\"");
                            return undefined;
                        }                                   
                    });     
                })();           
            }   

            return r;
        };
    };

    var statStructure = {
            n :  (function (args) { 
                    return args.xs.length;
                }),
            m : (function (args) {      
                    var sum = 0;
                    args.xs.forEach(function (value) {
                        sum += value;
                    });
                    return sum / args.n;
                }),
            m2 : (function (args) {
                    var sum = 0;
                    args.xs.forEach(function (value) {
                        sum += value * value;
                    });
                    return sum / args.n;
                }),
            v : (function (args) {
                    return args.m2 - args.m * args.m;
                }),
            dependency: 
                {
                    n: ["xs"],
                    m: ["xs", "n"],             
                    m2: ["xs", "n"],                
                    v: ["m2", "m"]      
                }
            };

    function test(){
        var statGraph = new Graph(statStructure);

        var calcStatGraph = statGraph({xs: [1,2,3,6]});
    
        console.log("Вычислим calcStatGraph.m: ");  
        console.log(calcStatGraph.m);  
        console.log("Вычислим calcStatGraph.v: ");  
        console.log(calcStatGraph.v);  

        return "Успех";
    }

    var text = [
        "Привет!",
        "Чтобы использовать \"Graph\", для начала нужно создать необходимую структуру ф-ций и их зависимости.",
        "Примером такой структуры является обьект statStructure", 
        "Далее, нужно создать обьект Graph с параметром этой структуры.",
        "Например, вот так: var statGraph = new Graph(statStructure);",
        "Далее, стоит выполнить функцию statGraph, передав в неё необходимые аргументы.",
        "Например, вот так var calcStatGraph = statGraph({xs: [1,2,3,6]}), где xs является параметром структуры",
        "Запрашивая поля полученного обьекта calcStatGraph, автоматически будут разрешаться зависимости.",
        "Например, запросив calcStatGraph.m, мы автоматически разрешим зависимость от calcStatGraph.n",
        "Для того, чтобы посмотреть, как это работает, можно запустить ф-цию \"test\"",
    ];

    console.log(text.join('\n'));
    console.log("Вот как она выглядит:");
    console.log(test);
    console.log("Запускаем. test()");
    console.log(test()); 