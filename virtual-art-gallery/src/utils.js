export function iterateAframeComponents(root, func) {
    const stack = [root];
    while(stack.length > 0) {
        const curr = stack.pop();
        func(curr);
        if(typeof curr.getChildEntities === "function") {
            stack.push.apply(stack, curr.getChildEntities());
        }
    }
}

export function ordinal(n) {
    let suffix;
    if(n >= 11 && n < 20) {
        suffix = 'th';
    } else if(n%10 === 1) {
        suffix = 'st';
    } else if(n%10 === 2) {
        suffix = 'nd';
    } else if(n%10 === 3) {
        suffix = 'rd';
    } else {
        suffix = 'th';
    }

    return `${n}${suffix}`;
}