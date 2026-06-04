// Circle helpers. Explore uses real π for accuracy; quizzes/worksheets use the
// kid-friendly π ≈ 3.14 so a child's hand calculation matches the answer key.
export const PI = Math.PI
export const PI_KID = 3.14

export const diameter = (r) => 2 * r
export const circumference = (r, pi = PI) => 2 * pi * r
export const area = (r, pi = PI) => pi * r * r
