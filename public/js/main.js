const login = async () => {
   const login_form = document.querySelector('form[name="login_form"]')
   const number = login_form.elements["number"].value;
   const password = login_form.elements["password"].value;  
   if (number == "" || password == "") {
      alert("Field cannot be empty.")
   }else{
      const body_data = `number=${number}&password=${password}`
      const result = await fetch("/auth/login",{
         method:"POST",
         headers:{
            "Content-Type": "application/x-www-form-urlencoded",
            "CrossOrigin": false,
         },
         body:body_data,
      })
      element = document.getElementById("login_errors")
      if (result.status == 401 && !result.ok){
         element.innerHTML = "Invalid Username Or Password"
         element.classList.remove("d-none")
      }else if (result.status == 200 && result.ok){
         element.classList.remove("d-block")
         element.classList.add("d-none")
         data = await result.json()
         window.location = data.callback
      }
   }
}

const moveToRegister = () => {
   window.location = `/auth/register?callback=${window.location.href}`
}

const register = async () => {
   const register_form = document.querySelector('form[name="register_form"]')
   const body_data = `f_name=${register_form.elements["f_name"].value}&l_name=${register_form.elements["l_name"].value}&number=${register_form.elements["number"].value}&password=${register_form.elements["password"].value}`
   const result = await fetch("/auth/register",{
      method:"POST",
      headers:{
         "Content-Type":"application/x-www-form-urlencoded",
         "CrossOrigin":false
      },
      body:body_data
   })
   if (result.status == 200){
      data = await result.json()
      window.location = data.callback
   }
}
