# Identity Reconciliator

### Abstract

This application exposes an api which accepts the contact's emailId and phone number in payload and links the contact with other contacts based on phone numbers and emailIds

### Approach

1. The primary contact is considered as the root node and all the other secondary contacts are considered as child nodes directly linked to the root node
2. If the both emailId and phone number of the contact are not present in database, the contact is created as primary contact.
3. If one of contact's emailId or phone number is present in database, a new secondary contact is created and is directly linked to the primary contact of the contact linked by either email or phone number which is already present in the database
4. If both emailId and phone number are present in database and primary contact of both contacts linked by phone number and emailId are same, then no changes are required
5. If both emailId and phone number are present in database and primary contact of both contacts linked by phone number and emailId are different, then
   a. find the primary contacts of both linked contacts
   b. find the contact which is created first
   c. Set the linkedId of second created primary contact as the id of first created primary contact and linkPrecedence as secondary
   d. Set the linkedId of all the secondary cotacts linked to second created primary contact as the id of first created primary contact so that all the secondary contacts are always directly linked to primary contact


### Tech Stack Used    
- Node
- PostgreSQL

### Packages installed
- express
- pg
- pg-hstore
- sequelize



