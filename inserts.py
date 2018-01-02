#-*- coding: utf-8 -*-
import models
import datetime

models.db.create_all()

models.db.session.add(models.Admins(
    "jfitzgerald@csumb.edu",
    "SuperAdmin",
    "2466d01e6903125458ad26828cca9f90ea0a2af1b637012c0bb71f4bc3cb3144:3a42a5bef15c47e7bc00cd2a3b57b0ce78e58d2424fa4e6e9c452acc16a0b361",
    True))
models.db.session.commit()

models.db.session.add(models.Discounts(
    "c5d0d951dd579674d44b137c69ad592ca63fdd6b24e276e7c2b78d113e0dff7a:e38b1f5d8b0b4051a62c0452eb20f95da46d1e6edeb04972aff7d68385d577a9",
    100,
    1000))
models.db.session.commit()

policy = models.Policy(
    1,
    "blue",#policy_color
    "Blue policy this is a high level of security good for your children")#desc
models.db.session.add(policy)
models.db.session.commit()

policy = models.Policy(
    2,
    "green",#policy_color
    "Green policy this is a mid level of security good for your children")#desc
models.db.session.add(policy)
models.db.session.commit()

policy = models.Policy(
    3,
    "red",#policy_color
    "Red policy this is a low level of security good for your children")#desc
models.db.session.add(policy)
models.db.session.commit()

leader = models.Leader(
    "Shawn",
    "Fitzgerald",
    "netmaker@cox.net",
    "12345",
    "4242424242424242042424242424",
    3,
    False)

models.db.session.add(leader)
models.db.session.commit()

member = models.Member(
    "Jason",
    "Fitzgerald",
    "jfitzgerald@csumb.edu",
    "12345",
    1)



license = models.License(
    3,#css
    3,#aep
    datetime.datetime(2018, 1, 1, 12),
    datetime.datetime(2019, 1, 1, 12),
    1,
    None)
    
models.db.session.add(license)
models.db.session.commit()


























# scavenger hunt

# models.db.session.add(models.Participants(
#     "katjones@csumb.edu",
#     "CQ",
#     "static/image/logo-small.png",
#     "12557a0701bb6d32c946e583885baa8094d1b3da1338e96e52b58823a18515c9:c96a3ea7786d423ab1bc7d8316a15990d3054cd6ece64c9181e9648cff046b19",
#     "230080283465983fdffc13798dc678de35b966819b5a1db1646f371a04c045e6:a403cbbcf5b741b7887d14ffc78c8607864fa42ed66449b7b11ec53c0628441b",
#     datetime.datetime(2017, 11, 2, 13),
#     datetime.datetime(2017, 11, 2, 15),
#     -1,
#     5,
#     5,
#     1325,
#     True,
#     1
#     ))
# models.db.session.commit()
