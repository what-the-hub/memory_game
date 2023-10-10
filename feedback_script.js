const validator = new JustValidate('#form')

const badWords = ['bad', 'ugly', 'hate', 'not good', 'dislike', 'angry', 'bug', 'fix']

validator
  .addField('#name', [
    {
      rule: 'required'
    },
    {
      rule: 'minLength',
      value: 3
    },
    {
      rule: 'maxLength',
      value: 15
    }
  ])
  .addField('#email', [
    {
      rule: 'required'
    },
    {
      rule: 'email'
    }
  ])
  .addField(
    '#agree-checkbox',
    [
      {
        rule: 'required'
      }
    ]
  )
  .addField('#feedback-message', [
    {
      validator: (value) => {
        return value !== undefined && value.length > 3
      },
      errorMessage: 'Message should be more than 3 letters.'
    },
    {
      validator: (value) => {
        const pattern = new RegExp(badWords.join('|'), 'i')
        return !pattern.test(value)
      },
      errorMessage: 'Message should contain only good feedback!'
    }
  ])

const form = document.getElementById('form')
form.addEventListener('submit', function (e) {
  e.preventDefault()
  if (validator.isValid) {
    alert('Thank you for the feedback! We will do nothing with it. Have a nice day!')
  }
})