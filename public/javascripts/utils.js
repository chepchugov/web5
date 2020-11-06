const success = (message) => {
    M.toast({
        html: `<i class="material-icons left">info</i><span>${message}</span>`,
        classes: 'green'
    });
};

const fail = (message) => {
    M.toast({
        html: `<i class="material-icons left">error</i><span>${message}</span>`,
        classes: 'red'
    });
};

const truncate = (text, length) => {
    if (text.length <= length) {
        return text;
    }
    return text.substr(0, length).concat("...");
};