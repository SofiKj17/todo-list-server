import {initializeApp} from "firebase/app";//импорт функции из библиотеки для работы с хранилищем
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, where} from "firebase/firestore";
import express, {response} from "express";// импорт фунции для обработки http запросов библиотека express

const firebaseConfig = {
    apiKey: "AIzaSyBj4IPhxjfH839EM5d7tfCTm3tn2ieFvfQ",
    authDomain: "todo-list-15ea1.firebaseapp.com",
    projectId: "todo-list-15ea1",
    storageBucket: "todo-list-15ea1.appspot.com",
    messagingSenderId: "225740307615",
    appId: "1:225740307615:web:0778d3d7545aa8036ff6aa",
    measurementId: "G-WVM9DK2H9B"
};

const app = express();// инициализация переменной, значение которой возвращает функция для обработки http запросов

const TaskStatus = {
    UPCOMING: 'Upcoming',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    REMOVED: 'Removed'
};

const firestoreApp = initializeApp(firebaseConfig);// подключение к хранилищу
const db = getFirestore(firestoreApp);//получаем объект db
const jsonParser = express.json();// тело запроса (json) из текста преобразует в объект

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    // любой домен
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT");
    // клиентская прилага в браузере шлет запрос на сервер с доменом не таким как у клиента
    // а сервер шлет ответ клиенту с прописанными заголовками
    next();
});

app.get("/", (request, response) => {
    const q = query(collection(db, 'tasks'), where('status', '==', request.query.status));//строим запрос в хранилище
    getDocs(q).then((result) => {
        const tasks = result.docs.map(task => Object.assign({id: task.id}, task.data()));
        response.send(tasks);// отправить на клиент
    });
});

app.post("/", jsonParser, (request, response) => {
    addDoc(collection(db, 'tasks'), request.body).then(() => {//ответ от хранилища нам не нужен - пусто
        //добавляем в хранилище таску, которая нам пришла в теле запроса
        response.sendStatus(200);
    });
});

app.put("/", (request, response) => { //DELETE заменили на PUT
    const taskRef = doc(db, 'tasks', request.query.id);// ссылка на таску в коллекции
    getDoc(taskRef).then((taskSnap) => {// достаем документ-объект по ссылке
        // taskSnap- документ из хранилища
        const task = Object.assign(taskSnap.data());//достаем все поля из дока. кроме ид
        task.status = TaskStatus.REMOVED;
        deleteDoc(taskRef).then(() => {
            addDoc(collection(db, 'tasks'), task).then(() => {
                response.sendStatus(200);
            });
        });
    });
});

//новый метод для удаления таски по id
app.delete("/", (request, response) => {
    deleteDoc(doc(db, 'tasks', request.query.id)).then(() => {
        response.sendStatus(200);
    });
});

app.listen(process.env.PORT || 3000);