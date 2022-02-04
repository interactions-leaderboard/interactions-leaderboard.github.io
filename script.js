window.addEventListener('load', () => {
    document.querySelector('.settings').addEventListener('click', () => {
        document.querySelector('.options').classList.toggle('hidden');
    })
    document.querySelector('.search').addEventListener('click', () => {
        document.querySelector('.options').classList.add('hidden');
        search();
    })

    let href = document.querySelector('a').href;
    const user = (el => (el.removeAttribute('id'), data => {
        const set = (q, v) => el.querySelector(q).innerHTML = v || '';
        el = el.cloneNode(true);
        set('.username', '@' + data.username);
        set('.displayname', data.name);
        set('.likes span', data.likes);
        set('.retweets span', data.retweets);
        set('.total span', data.likes + data.retweets);
        if (data.avatar) el.querySelector('.avatar').src = data.avatar;
        else el.querySelector('.avatar').removeAttribute('src');
        el.querySelector('a').href = href + data.username;
        return el;
    }))(document.querySelector('#user'));

    const settings = () => {
        const toggle = name => {
            let v = document.querySelector(`input[name=${name}]:checked`).value;
            return (v => v ? v - 1 ? true : undefined : false)(parseInt(v) || 0);
        }
        return {
            count: (i => (i || -1) < 0 ? tweets : i)(parseInt(input.value)),
            value: parseInt(document.querySelector('select').value) || 0,
            name: document.querySelector('input[type=text]').value,
            followers: toggle('followers'),
            following: toggle('following'),
            descending: !!toggle('order')
        }
    }

    const filter = settings => {
        let data = users.map(user => (u => (['likes', 'retweets'].map(v => u[v] = u[v]?.filter(i => i < settings.count)?.length || 0), u))({ ...user }));
        data = data.filter(user => [user.name, '@' + user.username].some(s => s.includes(settings.name)));
        if (settings.followers !== undefined) data = data.filter(u => !!u.follower === settings.followers);
        if (settings.following !== undefined) data = data.filter(u => !!u.following === settings.following);
        const value = (i => u => i ? i - 1 ? u.likes + u.retweets : u.likes : u.retweets)(settings.value); 
        return data.sort((a, b) => (value(a) - value(b)) * (settings.descending ? -1 : 1));
    }

    let i = 0;
    const search = () => {
        let [c, j] = [++i, 0];
        let users = document.querySelector('.users');
        let scroll = document.querySelector('.scroll');
        users.classList.add('hidden'), scroll.innerHTML = '';
        const chunk = () => scroll.append(...data.slice(j, j += 20).map(user));
        users.classList.remove('hidden');
        let data = filter(settings());
        const scrolled = () => {
            if (c !== i) return users.removeEventListener('scroll', scrolled);
            let height = users.scrollHeight - users.clientHeight;
            if (height - users.scrollTop < 100) chunk();
        }
        while (users.clientHeight > scroll.clientHeight) chunk();
        users.addEventListener('scroll', scrolled);
    }

    let users = [];
    fetch('./users.json').then(res => {
        res.json().then(res => {
            users = res;
            search();
        })
    })

    let tweets = 3081;
    document.querySelector('.max').innerHTML = tweets;
    let input = document.querySelector('input[type=number]');
    input.placeholder = tweets;
})
