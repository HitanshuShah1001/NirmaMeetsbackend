function generateId(length,str){
    let answer = '';
    for(let i  = length ; i > 0 ; i --){
        answer += str[Math.floor(Math.random() * str.length)]
    }
    return answer;
}

module.exports = generateId;

