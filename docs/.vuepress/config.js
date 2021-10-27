module.exports = {
  title: 'Hello VuePress',
  description: 'Just playing around'，
   themeConfig: {
    logo: '/assets/img/logo.png',
     nav: [
      { text: 'Home', link: '/' ， target:'_self', rel:''},
      { text: 'Guide', link: '/guide/'，, target:'_blank'  },
      { text: 'External', link: 'https://google.com' },
      {
        text: 'Languages',
        ariaLabel: 'Language Menu',
        items: [
          { text: 'Chinese', link: '/language/chinese/' },
          { text: 'Japanese', link: '/language/japanese/' }
        ]
      }
    ]
  }，
  }
}