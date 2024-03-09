FROM node:16

WORKDIR /home/app

COPY ./package.json .
COPY ./package-lock.json .

RUN npm config set registry https://registry.npmmirror.com/ && npm install
# RUN npm config set registry https://registry.npmmirror.com/

EXPOSE 7777

# 如果arg server_ip不为空，则替换配置文件中的server_ip
ARG SERVER_IP
ENV SERVER_IP=${SERVER_IP}
# 运行env.py传递参数
#RUN python3 env.py $SERVER_IP

#CMD ["npm", "run", "serve", "--", "--port", "7777"]
ENTRYPOINT [ "./start.sh" ]
