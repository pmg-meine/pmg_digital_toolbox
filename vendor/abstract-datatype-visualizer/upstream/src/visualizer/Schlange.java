/** Warteschlangenknoten nach QUA-LiS NRW, Version Generisch_02 2014-02-21. */
public class QueueNode<ContentType> {
   private ContentType content;
   private QueueNode<ContentType> nextNode;

   public QueueNode(ContentType content) { this.content = content; }
   public void setNext(QueueNode<ContentType> next) { nextNode = next; }
   public QueueNode<ContentType> getNext() { return nextNode; }
   public ContentType getContent() { return content; }
}

/** Generische Warteschlange nach den NRW-Abiturmaterialien (First-In-First-Out). */
public class Schlange<ContentType> {
   private QueueNode<ContentType> head;
   private QueueNode<ContentType> tail;

   public Schlange() { head = null; tail = null; }
   public boolean isEmpty() { return head == null; }

   /** Haengt einen Inhalt an; null bleibt wirkungslos. */
   public void enqueue(ContentType content) {
      if (content != null) {
         QueueNode<ContentType> node = new QueueNode<ContentType>(content);
         if (isEmpty()) { head = node; tail = node; }
         else { tail.setNext(node); tail = node; }
      }
   }

   /** Entfernt und liefert den ersten Inhalt, bei leerer Schlange null. */
   public ContentType dequeue() {
      if (isEmpty()) { return null; }
      ContentType content = head.getContent();
      head = head.getNext();
      if (isEmpty()) { tail = null; }
      return content;
   }

   /** Liefert den ersten Inhalt ohne Aenderung, bei leerer Schlange null. */
   public ContentType head() {
      if (isEmpty()) { return null; }
      return head.getContent();
   }
}
