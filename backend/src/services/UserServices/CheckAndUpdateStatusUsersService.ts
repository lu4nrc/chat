import ListUsersByStatusService from "./ListUsersByStatusService";
function diff_minutes(dt2:Date, dt1:Date) 
 {

  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
  
 }
const CheckAndUpdateStatusUsersService = async (): Promise<any | undefined> => {
  const users = await ListUsersByStatusService();
  const date: Date = new Date();
  

  await Promise.all(users.users.map(async(user)=>{
    var datetime:Date= user.datetime;
   if(diff_minutes(date,datetime)>1 ){
   await user.update({
        status:"inactive"
      })
    }else{
      return;
    }
    }
  ))

 
};

export default CheckAndUpdateStatusUsersService;
