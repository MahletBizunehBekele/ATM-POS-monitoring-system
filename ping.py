import asyncio
import aiohttp
import ping3
import time
from typing import List, Tuple
from flask import Flask
from flask_mailman import Mail, EmailMessage
from twilio.rest import Client
import keys #importing credentials for sms message notification

mail = Mail()

app = Flask(__name__)

# Configure Flask-Mail
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587 
app.config["MAIL_USERNAME"] = SENDER_EMAIL
app.config["MAIL_PASSWORD"] = SENDER_PASSWORD
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False

mail.init_app(app) 

recipient_emails = []
firstPriority_emails = []
secondPriority_emails = []
atm_ip = []
atm_current =[]
POS_ip =[]

async def fetch_recipients():
    global recipient_emails
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get('http://localhost:5000/alert-recipients') as response:
                if response.status == 200:
                    recipient_emails = await response.json()  # Parse JSON response
                else:
                    print(f"Failed to update recipient emails status. Status code: {response.status}")
        except Exception as e:
            print(f"Error updating recipient emails status: {e}")

async def send_email(subject, body, recipients):

    email_recipients = [email.strip() for email in recipients[0].split(',')]

    for recipient in email_recipients:
        with app.app_context():
            email = recipient
            msg = EmailMessage(
                subject,
                body,
                "mtool267@gmail.com",
                [email]
            )
            try:
                msg.send()
                print(f"Email sent successfully! to {email}")
            except Exception as e:
                print(f"Failed to send email: {e}")

async def send_sms():
    client = Client(keys.account_sid, keys.auth_token)

    message = client.messages.create(
    from_=keys.from_number,
    body='Twilio testing',
    to= keys.to_number
    )

    print(message.sid)

async def log_ATMalert(alertmsg, ipaddress, status, hostname, emails):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post('http://localhost:5000/logalertforATM', json={
                'emails': emails,
                'alertmsg': alertmsg,
                'ipaddress': ipaddress,
                'hostname':hostname,
                'status': status
            }) as response:
                if response.status == 200:
                    print(f"Alert log successful for {ipaddress}")
                else:
                    print(f"Failed to log alert. Status code: {response.status}")
        except Exception as e:
            print(f"Error logging alert: {e}")


async def log_POSalert(alertmsg, ipaddress, status, hostname, recipients):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post('http://localhost:5000/logalertforPOS', json={
                'emails': recipients,
                'alertmsg': alertmsg,
                'ipaddress': ipaddress,
                'hostname':hostname,
                'status': status
            }) as response:
                if response.status == 200:
                    print(f"Alert log successful for {ipaddress}")
                else:
                    print(f"Failed to log alert. Status code: {response.status}")
        except Exception as e:
            print(f"Error logging alert: {e}")

async def get_registered_ATMip(ip):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f'http://localhost:5000/registered-ip', params={'ip': ip}) as response:
                if response.status == 200:
                    result = await response.json()
                    if isinstance(result, bool):
                        print(f"Received boolean: {result}")
                        return result
                    else:
                        print("Received data is not a boolean")
                else:
                    print(f"Failed to fetch data. Status code: {response.status}")
        except Exception as e:
            print(f"Error fetching status: {e}")

async def get_registered_POSip(ip):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f'http://localhost:5000/registered-POSip', params={'ip': ip}) as response:
                if response.status == 200:
                    result = await response.json()
                    if isinstance(result, bool):
                        print(f"Received boolean: {result}")
                        return result
                    else:
                        print("Received data is not a boolean")
                else:
                    print(f"Failed to fetch data. Status code: {response.status}")
        except Exception as e:
            print(f"Error fetching status: {e}")

async def ping(ip: str) -> bool:
    try:
        result = ping3.ping(ip, timeout=2)
        print(result)
        return result is not None
    except Exception as e:
        print(e)
        return False
    
async def get_atmip():
    global atm_ip
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f'http://localhost:5000/retrieveATMIp') as response:
                if response.status == 200:
                    atm_ip = await response.json() 
                else:
                    print(f"Failed to retrieve atm hostname and ip. Status code: {response.status}")
        except Exception as e:
            print(f"Error fetching atm info status: {e}")


async def get_POSip():
    global POS_ip
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f'http://localhost:5000/retrievePosip') as response:
                if response.status == 200:
                    POS_ip = await response.json()
                else:
                    print(f"Failed fetching POS data: ", {response.status})
        except Exception as e:
            print(f"Error fetching data, {e}")
async def get_atmCurrentStatus():
    global atm_current
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f'http://localhost:5000/retrieveATMCurrent') as response:
                if response.status == 200:
                    atm_current = await response.json()
                else:
                    print(f"Failed to retrieve atm current info. Status code: {response.status}")
        except Exception as e:
            print( f"Error fetching atm current info status: {e}")    

async def update_status(id, status):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(f'http://localhost:5000/updateStatus', params={'id': id , 'status': status}) as response:
                if response.status == 200:
                    print("Success")
        except Exception as e:
            print( f"Error update atm status: {e}")    

failure_timestamps = {}
async def monitor_ATMavailability():  
    print("monitor_atmsdevices started")
    while True:
        await get_atmip()
        print("Running monitor_machinesdevices loop...")
        ips = [entry['ip_address'] for entry in atm_ip]
        print(ips)
        tasks = [ping(ip) for ip in ips]
        results = await asyncio.gather(*tasks)
        
        for ip, result in zip(ips, results):
            registered_data = await get_registered_ATMip(ip)
            for entry in atm_ip:
                if entry['ip_address'] == ip:
                    name = entry['atm_name']
                    firstPriority_emails = [entry['Email_one']]
                    secondPriority_emails = [entry['Email_two']]

            if result:  
                print(f"ATMAVAILABITLITY---------------Ping to {name} successful.")
                
                if ip in failure_timestamps:
                    del failure_timestamps[ip]

                if registered_data:
                    await log_ATMalert(f"Ping to {name} failed.", ip, "RUNNING", name, [])
            else: 
                print(f"ATMAVAILABITLITY---------------Ping to {name} failed.")

                if ip not in failure_timestamps:
                    failure_timestamps[ip] = time.time()
                else:
                    time_failed = time.time() - failure_timestamps[ip]

                    if time_failed >= 30 * 60 and time_failed < 90 * 60:
                        # Send the first priority email if 30 minutes have passed
                        await send_email("ATM Alert Message", f"Ping to {name} failed for over 30 minutes.", firstPriority_emails)
                        await log_ATMalert(f"Ping to {name} failed.", ip, "FAILED", name, firstPriority_emails)
                        print(f"First priority email sent to {firstPriority_emails}")

                    # Check if the machine has been down for 1 hour 30 minutes (90 minutes)
                    elif time_failed >= 90 * 60:
                        # Send the second priority email if 90 minutes have passed
                        await send_email("ATM Alert Message", f"Ping to {name} failed for over 90 minutes.", secondPriority_emails)
                        await log_ATMalert(f"Ping to {name} failed.", ip, "FAILED", name, secondPriority_emails)
                        print(f"Second priority email sent to {secondPriority_emails}")

        print("-----------------------ATMmachineAvailability------------------------------")              
        await asyncio.sleep(60 * 10)  

failure_cashTimeStamps = {}
async def Monitor_ATMCash():
    print("Monitor_ATMCash started...")
    while True:
        await get_atmip()
        await get_atmCurrentStatus()
        for entry in atm_current:
            corresponding_machine = next((atm for atm in atm_ip if atm['atmID'] == entry['atm_id']), None)

            if corresponding_machine:
                name = corresponding_machine['atm_name']
                firstPriority_emails = corresponding_machine['Email_one']
                secondPriority_emails = corresponding_machine['Email_two']
                if entry['Current_Amount'] < corresponding_machine['minimum_amount']:

                    if entry['atm_id'] not in failure_cashTimeStamps:
                        failure_cashTimeStamps[entry['atm_id']] = time.time()
                    else:
                        time_failed = time.time() - failure_cashTimeStamps[entry['atm_id']]
                        # Check if the machine has been down for 30 minutes
                        if time_failed >= 30 * 60 and time_failed < 90 * 60:
                            # Send the first priority email if 30 minutes have passed
                            await send_email("Alert Message", f"{name} \nLow Cash Warning: Replenishment Required", [firstPriority_emails])
                            print(f"First priority email sent to {firstPriority_emails}")

                        # Check if the machine has been down for 1 hour 30 minutes (90 minutes)
                        elif time_failed >= 90 * 60:
                            # Send the second priority email if 90 minutes have passed
                            await send_email("Alert Message",f"{name} \nLow Cash Warning for over 30 mins: Replenishment Required", [secondPriority_emails])
                            print(f"Second priority email sent to {secondPriority_emails}")
                        
                    await update_status(entry['atm_id'], "ALERT")
                    print("MONITORCASH-------------Alert Message", f"{name} \nLow Cash Warning: Replenishment Required")
                elif entry['Current_Amount'] > corresponding_machine['minimum_amount']:

                    if entry['atm_id'] in failure_cashTimeStamps:
                        del failure_cashTimeStamps[entry['atm_id']]

                    await update_status(entry['atm_id'], "NORMAL") 
        print("-----------------------atmcash------------------------------")              
        await asyncio.sleep(60*10) 
async def update_product_status(product_name, breach_amount):
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post('http://localhost:5000/update-product-status', json={
                'product_name': product_name,
                'breach_amount': breach_amount
            }) as response:
                if response.status == 200:
                    print(f"Product status updated for {product_name}")
                else:
                    print(f"Failed to update product status. Status code: {response.status}")
        except Exception as e:
            print(f"Error updating product status: {e}")


async def Monitor_Parameters():
    await fetch_recipients()
    print("Monitor_Parameters started")
    async with aiohttp.ClientSession() as session:
        while True:
            print("Running Monitor_Parameters loop...")
            try:
                async with session.get('http://localhost:5000/productAlert') as response:
                    if response.status == 200:
                        data = await response.json()
                        breachproducts = data  

                        print(breachproducts)

                        for product in breachproducts:
                            product_name = product['product']
                            breach_amount = product['breachamount']
                            if product_name and breach_amount:
                                for recipient in recipient_emails:
                                    print( recipient['username'])
                                    await send_email(
                                        "Product Alert!",
                                        f"Alert for product {product_name}: Breach amount is {breach_amount}.", [recipient['username']]
                                    )
                                await update_product_status(product_name, breach_amount)
                    else:
                        print(f"Failed to fetch product alerts. Status code: {response.status}")
            except Exception as e:
                print(f"Error fetching product alerts: {e}")

            await asyncio.sleep(60*15) 
     
failuredPOS_timestamps = {}
async def Monitor_POSavailability():  
    await get_POSip()
    print("monitor_POS   sdevices started")
    while True:
        print("Running monitor_POSdevices loop...")
        ips = [entry['ip_address'] for entry in POS_ip]
        print(ips)
        tasks = [ping(ip) for ip in ips]
        results = await asyncio.gather(*tasks)
        
        for ip, result in zip(ips, results):
            registered_data = await get_registered_POSip(ip)
            for entry in POS_ip:
                if entry['ip_address'] == ip:
                    name = entry['POS_name']
                    firstPriority_emails = [entry['Email_one']]
                    secondPriority_emails = [entry['Email_two']]

            if result:  
                print(f"POSAVAILABITLITY---------------Ping to {name} successful.")
                
                if ip in failuredPOS_timestamps:
                    del failuredPOS_timestamps[ip]

                if registered_data:
                    await log_POSalert(f"Ping to {name} failed.", ip, "RUNNING", name, [])
            else: 
                print(f"POSAVAILABITLITY---------------Ping to {name} failed.")

                if ip not in failuredPOS_timestamps:
                    failuredPOS_timestamps[ip] = time.time()
                else:
                    time_failed = time.time() - failuredPOS_timestamps[ip]

                    # Check if the machine has been down for 30 minutes
                    if time_failed >= 30 * 60 and time_failed < 90 * 60:
                        # Send the first priority email if 30 minutes have passed
                        await send_email("POS Alert Message", f"Ping to {name} failed.", firstPriority_emails)
                        await log_POSalert(f"Ping to {name} failed.", ip, "FAILED", name, firstPriority_emails)
                        print(f"First priority email sent to {firstPriority_emails}")

                    # Check if the machine has been down for 1 hour 30 minutes (90 minutes)
                    elif time_failed >= 90 * 60:
                        # Send the second priority email if 90 minutes have passed
                        await send_email("POS Alert Message", f"Ping to {name} failed for over 30 minutes.", secondPriority_emails)
                        await log_POSalert(f"Ping to {name} failed.", ip, "FAILED", name, secondPriority_emails)
                        print(f"Second priority email sent to {secondPriority_emails}")
                    
        print("-------------------------POSmachineAvailability------------------------------")              
        await asyncio.sleep(60 * 15)  


async def main():
    await asyncio.gather(
        monitor_ATMavailability(),
        Monitor_Parameters(),
        Monitor_ATMCash(),
        Monitor_POSavailability()
    )

if __name__ == "__main__":
    asyncio.run(main())
