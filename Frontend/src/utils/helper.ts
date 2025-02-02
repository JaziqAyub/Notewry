// export const validateEmail = (email) =>{
//     const = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return RegExp.test(email)
// }


export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Fixed variable declaration
    return regex.test(email); // Proper use of regex test method
  };
  

  export const getInitials = (name: string) => {
    if (!name) return ""

    const words = name.split (" ")
    let initials = ""

    for (let i = 0; i<Math.min(words.length, 2); i++){
      initials += words[i][0]
    }

    return initials.toUpperCase()
  }