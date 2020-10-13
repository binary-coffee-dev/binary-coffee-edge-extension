function refresh() {
    return $.ajax({
        type: 'GET',
        url: "https://api.binary-coffee.dev/posts/feed/json1",
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Content-Type': 'application/json; charset=utf-8',
            'Accept-Language': 'es-ES,en-US;q=0.7,en;q=0.3',
            'Upgrade-Insecure-Requests': 1,
        },
        success: function (data) {
            $('.loading').fadeOut(1000, function () {
                $('.loading').addClass('hidden')
                let number = 1
                data.items.forEach(element => {
                    let post = $('<div>', {
                        class: 'post'
                    })

                    let post_number = $('<div>', {
                        class: 'post-number',
                        html: number++
                    })
                    post.append(post_number)

                    let post_link = $('<a/>', {
                        class: 'post-link',
                        href: element.url,
                        target: 'blanck'
                    })
                    post.append(post_link)

                    let post_name = $('<h3/>', {
                        class: 'post-name',
                        html: element.title
                    })
                    post_link.append(post_name)


                    let post_data = ('<p>', {
                        class: 'post-data',
                        html: element.description,
                    })
                    post_link.append(post_data)

                    $('.post-container').append(post)
                })
            })
        }
    });
}
refresh();