import { request } from 'https'

/**
 * Generate a checksum (original codee from DT's sources)
 * @param {string} str String to transform
 */
export function checksum(str: string): string
{
  let r = 0
  for (let i = 0; i < str.length; i++) {
    r += str.charCodeAt(i) % 16
  }
  return (r % 16).toString(16).toUpperCase()
}

/**
 * Generate one random character
 * @returns {string}
 */
export function getRandomChar(): string
{
  let n = Math.ceil(Math.random() * 100)
  if (n <= 40) return String.fromCharCode(Math.floor(Math.random() * 26) + 65) // Majuscule
  if (n <= 80) return String.fromCharCode(Math.floor(Math.random() * 26) + 97) // Minuscule
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48) // Numero
}

// Generate string of <length> characters, Example : "O6FBjgAe3KaKyqL2XSu5B"
/**
 * Generate a string of `length` characters
 * @param {number} length Length of characters to generate
 * @returns {string}
 */
export function generateString(length: number = 10): string
{
  let key = ''
  for (let i = 0; i < length; i++) {
    key += this.getRandomChar()
  }
  return key + this.checksum(key)
}

export function ucFirst(input: string): string
{
  return input.charAt(0).toUpperCase() + input.slice(1)
}

export function ucLower(input: string): string
{
  return input.charAt(0).toLowerCase() + input.slice(1)
}

export function getJson(url: string, options: any = {}): Promise<string>
{
  return new Promise((resolve, reject) => {
    const req = request(url, options, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => resolve(JSON.parse(data)))
    })

    req.on('error', err => reject(err))
    req.write(options.data || '')
    req.end()
  })
}
